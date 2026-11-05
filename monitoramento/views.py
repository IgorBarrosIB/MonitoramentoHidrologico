from rest_framework import viewsets                       # viewsets do DRF para CRUD automático
from .models import Station, Observation                        # modelos/tabelas usados nas views
from .serializers import StationSerializer, ObservationSerializer # serializers para (de)serializar os modelos
from django_filters.rest_framework import DjangoFilterBackend  # permite filtragem via query params
from rest_framework.decorators import action                  # decorator que cria rotas extras dentro de um ViewSet
from rest_framework.response import Response                  # resposta do DRF que converte dict/list em JSON

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

# ViewSet para o modelo Observation — fornece endpoints CRUD e suporte a filtros
class ObservationViewSet(viewsets.ModelViewSet):
   queryset = Observation.objects.all()         # queryset base para operações do ViewSet
   serializer_class = ObservationSerializer     # serializer usado para observations
   filter_backends = [DjangoFilterBackend]  # habilita filtragem via django-filter
   # campos permitidos para filtragem via query string, ex: ?station=EST-01&metric=level
   filterset_fields = ['station_id','metric', 'observed_at', 'value', 'unit']
