from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from monitoramento.views import StationViewSet, ObservationViewSet
from rest_framework.authtoken.views import obtain_auth_token
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView # Adicionado para o drf-spectacular

router = DefaultRouter()
router.register(r'stations', StationViewSet)
router.register(r'observations', ObservationViewSet)

urlpatterns = [
   path('admin/', admin.site.urls),
   path('api/', include(router.urls)),
   path('api/token/', obtain_auth_token),
   path('api/schema/', SpectacularAPIView.as_view(), name='schema'),               # Adicionado para o drf-spectacular
   path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'), # Adicionado para o drf-spectacular
   path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'), # Adicionado para o drf-spectacular
]
