from datetime import datetime, timedelta                       # datas e intervalos de tempo (ex.: 24 horas)
from rest_framework import viewsets                      # viewsets do DRF para CRUD automático
from .models import Station, Observation                        # modelos/tabelas usados nas views
from .serializers import StationSerializer, ObservationSerializer # serializers para (de)serializar os modelos
from django_filters.rest_framework import DjangoFilterBackend  # permite filtragem via query params
from rest_framework.decorators import action                  # decorator que cria rotas extras dentro de um ViewSet
from rest_framework.response import Response                  # resposta do DRF que converte dict/list em JSON
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample, OpenApiTypes

# ViewSet para o modelo Station — fornece endpoints list/retrieve/create/update/destroy
class StationViewSet(viewsets.ModelViewSet):
   queryset = Station.objects.all()         # queryset base usado pelo ViewSet
   serializer_class = StationSerializer     # serializer que define representação e validação
   filter_backends = [DjangoFilterBackend]  # habilita filtragem via django-filter
   # campos permitidos para filtragem via query string, ex: ?municipality=Vale Verde
   filterset_fields = ['name', 'river', 'municipality']

   # Estudar
   # GET /api/stations/{id}/summary/ — últimas leituras e local da estação
   # detail=True: a rota atua sobre UMA estação, por isso a URL leva o {id}
   # methods=['get']: aceita apenas leitura (GET); outros métodos retornam 405
   # o nome da função ("summary") vira o final da URL: /stations/{id}/summary/
   @action(detail=True, methods=['get'])
   def summary(self, request, pk=None):  # request = requisição HTTP; pk = o {id} capturado da URL
       station = self.get_object()  # busca a Station com esse pk no queryset; se não existir, retorna 404

       latest = {}  # dicionário que vai guardar a última leitura de cada métrica
       for metric in ['level', 'rain']:  # percorre as métricas: nível do rio e chuva
           obs = (Observation.objects.filter(station=station, metric=metric)  # observações desta estação e desta métrica
                  .order_by('-observed_at')  # ordena da mais recente para a mais antiga (o "-" inverte a ordem)
                  .first())  # pega só a primeira (a mais recente); retorna None se não houver nenhuma
           if obs:  # só adiciona ao resultado se existir leitura dessa métrica
               latest[metric] = {  # ex.: latest['level'] = {...}
                   'value': obs.value,              # valor medido
                   'unit': obs.unit,                # unidade (m ou mm/h)
                   'observed_at': obs.observed_at,  # data/hora da leitura
               }

       return Response({  # monta a resposta JSON com status 200
           'station': StationSerializer(station).data,  # local: converte a estação em dict (id, nome, rio, município)
           'latest': latest,                            # última leitura de cada métrica
       })

   # "Pega o caderninho da EST-01, olha só as anotações de nível do rio (level) e me mostra as das últimas 24 horas, em ordem."
   # GET /api/stations/{id}/series/?metric=level&hours=24 — histórico de uma métrica para o gráfico
   @extend_schema(
       summary="Consultar histórico de nível do rio ou chuva",
       description=(
           "Retorna as leituras de uma estação em ordem cronológica. "
           "Use metric=level para nível do rio ou metric=rain para chuva. "
           "O período padrão é de 24 horas."
       ),
       parameters=[
           OpenApiParameter(
               name="metric",
               type=OpenApiTypes.STR,
               location=OpenApiParameter.QUERY,
               description="Métrica consultada: level (nível do rio) ou rain (chuva).",
               required=False,
               default="level",
               enum=["level", "rain"],
           ),
           OpenApiParameter(
               name="hours",
               type=OpenApiTypes.INT,
               location=OpenApiParameter.QUERY,
               description="Período em horas. Padrão: 24. Intervalo previsto no desafio: 1 a 72.",
               required=False,
               default=24,
           ),
       ],
       examples=[
           OpenApiExample(
               name="Exemplo de histórico do nível do rio",
               value={
                   "station": "EST-01",
                   "metric": "level",
                   "hours": 24,
                   "unit": "m",
                   "points": [
                       {
                           "observed_at": "2026-11-11T20:00:00.000Z",
                           "value": 1.13,
                       }
                   ],
               },
               response_only=True,
               status_codes=["200"],
           ),
       ],
   )
   @action(detail=True, methods=['get'])
   def series(self, request, pk=None):
       station = self.get_object()  # busca a estação pelo {id}; se não existir, retorna 404

       # query_params guarda o que vem depois do "?" na URL; o 2º valor é o padrão se não vier nada
       metric = request.query_params.get('metric', 'level')  # qual métrica: level (nível) ou rain (chuva)
       try:
           hours = int(request.query_params.get('hours', 24))  # quantas horas para trás; texto -> número
       except ValueError:  # se mandarem algo que não é número, ex.: hours=abc
           return Response({'detail': 'hours deve ser um número inteiro.'}, status=400)

       # todas as leituras desta estação e métrica, da mais antiga para a mais nova (ordem do gráfico)
       observations = Observation.objects.filter(station=station, metric=metric).order_by('observed_at')

       last = observations.last()  # a leitura mais recente (a última da fila); None se não houver nenhuma
       if last is None:  # sem leituras: devolve a lista vazia
           return Response({'station': station.id, 'metric': metric, 'hours': hours, 'unit': None, 'points': []})

       # a janela de tempo termina na última leitura e começa "hours" horas antes dela
       end = datetime.fromisoformat(last.observed_at)  # texto ISO -> data de verdade, para poder fazer conta
       start = end - timedelta(hours=hours)            # volta "hours" horas no tempo
       start_text = start.strftime('%Y-%m-%dT%H:%M:%S.000Z')  # data -> texto, no mesmo formato salvo no banco

       # como as datas são texto no mesmo formato, comparar texto funciona igual comparar datas
       observations = observations.filter(observed_at__gte=start_text)  # __gte = "maior ou igual a"

       # cada ponto do gráfico: eixo X = data/hora, eixo Y = valor
       points = [{'observed_at': obs.observed_at, 'value': obs.value} for obs in observations]

       return Response({
           'station': station.id,  # código da estação
           'metric': metric,       # métrica pedida
           'hours': hours,         # tamanho da janela em horas
           'unit': last.unit,      # unidade do eixo Y (m para level)
           'points': points,       # lista de pontos, já em ordem cronológica
       })

# ViewSet para o modelo Observation — fornece endpoints CRUD e suporte a filtros
class ObservationViewSet(viewsets.ModelViewSet):
   queryset = Observation.objects.all()         # queryset base usado pelo ViewSet
   serializer_class = ObservationSerializer     # serializer usado para observations
   filter_backends = [DjangoFilterBackend]  # habilita filtragem via django-filter
   # campos permitidos para filtragem via query string, ex: ?station=EST-01&metric=level
   filterset_fields = ['station_id','metric', 'observed_at', 'value', 'unit']