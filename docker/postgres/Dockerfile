FROM postgres:17.11-trixie

ENV TZ=UTC \
    PGTZ=UTC

HEALTHCHECK --interval=5s --timeout=3s --start-period=10s --retries=10 \
    CMD pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" -h 127.0.0.1 || exit 1
