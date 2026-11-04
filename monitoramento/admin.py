from django.contrib import admin
from .models import Station, Observation

# Admin para o modelo Station: mostra o campo 'name' e permite busca por nome
@admin.register(Station)
class StationAdmin(admin.ModelAdmin):

   list_display =  ['name', 'river', 'municipality']     # colunas exibidas na listagem
   search_fields = ['name', 'river', 'municipality']     # campos pesquisáveis
   list_filter =   ['name', 'river', 'municipality']     # filtros laterais

# Admin para o modelo Observation: exibe campos principais e adiciona filtros
@admin.register(Observation)
class ObservationAdmin(admin.ModelAdmin):
   list_display =  ['station_id', 'metric', 'observed_at', 'value', 'unit', 'source']  # colunas na listagem
   search_fields = ['station_id', 'metric']                                  # campos pesquisáveis
   list_filter =   ['station_id', 'metric','observed_at', 'unit']            # filtros laterais

# O Token já aparece no admin: o app 'rest_framework.authtoken' registra o próprio admin

