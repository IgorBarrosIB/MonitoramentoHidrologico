from rest_framework import viewsets                       # viewsets do DRF para CRUD automático
from .models import Station, Observation                        # modelos/tabelas usados nas views
from .serializers import StationSerializer, ObservationSerializer # serializers para (de)serializar os modelos
from django_filters.rest_framework import DjangoFilterBackend  # permite filtragem via query params

# ViewSet para o modelo Station — fornece endpoints list/retrieve/create/update/destroy
class StationViewSet(viewsets.ModelViewSet):
   queryset = Station.objects.all()         # queryset base usado pelo ViewSet
   serializer_class = StationSerializer     # serializer que define representação e validação
   filter_backends = [DjangoFilterBackend]  # habilita filtragem via django-filter
   # campos permitidos para filtragem via query string, ex: ?municipality=Vale Verde
   filterset_fields = ['name', 'river', 'municipality']

# ViewSet para o modelo Observation — fornece endpoints CRUD e suporte a filtros
class ObservationViewSet(viewsets.ModelViewSet):
   queryset = Observation.objects.all()         # queryset base para operações do ViewSet
   serializer_class = ObservationSerializer     # serializer usado para observations
   filter_backends = [DjangoFilterBackend]  # habilita filtragem via django-filter
   # campos permitidos para filtragem via query string, ex: ?station=EST-01&metric=level
   filterset_fields = ['station_id','metric', 'observed_at', 'value', 'unit']
