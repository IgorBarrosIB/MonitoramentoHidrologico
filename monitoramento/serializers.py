from rest_framework import serializers  # ferramentas do DRF transformar a tabela em JSON
from .models import Station, Observation        # modelos usados pelos serializers

class StationSerializer(serializers.ModelSerializer):
   class Meta:
       model = Station
       fields = '__all__'  # expõe todos os campos do modelo Station

class ObservationSerializer(serializers.ModelSerializer):
   class Meta:
       model = Observation
       fields = '__all__'  # expõe todos os campos do modelo Observation
