from django.db import models


class Station(models.Model):
   id = models.CharField(max_length=20, primary_key=True)  # código da estação (ex.: EST-01)
   name = models.CharField(max_length=255)                 # nome da estação
   river = models.CharField(max_length=255)                # rio monitorado
   municipality = models.CharField(max_length=255)         # município da estação

   class Meta:
       db_table = 'stations'  # mesmo nome de tabela usado no BancoDeDados.py

   def __str__(self):
       return self.name  # representação em string da estação

class Observation(models.Model):
   station = models.ForeignKey(Station, on_delete=models.CASCADE)  # relacionamento com Station
   metric = models.CharField(max_length=50)       # métrica observada (level ou rain)
   observed_at = models.CharField(max_length=30)  # data/hora da observação em ISO
   value = models.FloatField()                    # valor medido
   unit = models.CharField(max_length=20)         # unidade de medida (m ou mm/h)
   source = models.CharField(max_length=50)       # origem do dado

   class Meta:
       db_table = 'observations'                                # mesmo nome de tabela usado no BancoDeDados.py
       unique_together = ('station', 'metric', 'observed_at')  # evita observação duplicada

   def __str__(self):
       return f'{self.station} - {self.metric}'  # representação em string da observação
