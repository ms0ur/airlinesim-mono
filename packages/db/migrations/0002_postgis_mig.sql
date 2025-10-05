-- включаем postgis (идемпотентно)
CREATE EXTENSION IF NOT EXISTS postgis;

-- если колонка называлась 'lng' — переименуем в 'lon'
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'airports' AND column_name = 'lng'
  ) THEN
ALTER TABLE airports RENAME COLUMN lng TO lon;
END IF;
END$$;

-- конвертируем строки в double precision (учёт запятых/пустых значений)
ALTER TABLE airports
ALTER COLUMN lat TYPE double precision
  USING NULLIF(REPLACE(lat::text, ',', '.'), '')::double precision;

ALTER TABLE airports
ALTER COLUMN lon TYPE double precision
  USING NULLIF(REPLACE(lon::text, ',', '.'), '')::double precision;

-- ограничения диапазонов и NOT NULL (включай когда уверен в данных)
ALTER TABLE airports
    ADD CONSTRAINT airports_lat_chk CHECK (lat BETWEEN -90 AND 90),
  ADD CONSTRAINT airports_lon_chk CHECK (lon BETWEEN -180 AND 180);

ALTER TABLE airports
    ALTER COLUMN lat SET NOT NULL,
ALTER COLUMN lon SET NOT NULL;

-- сгенерированные PostGIS-колонки (строятся из lon/lat)
ALTER TABLE airports
    ADD COLUMN geog geography(Point,4326)
  GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography) STORED;

ALTER TABLE airports
    ADD COLUMN geom geometry(Point,4326)
  GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(lon, lat), 4326)) STORED;

-- индексы под геозапросы
CREATE INDEX IF NOT EXISTS airports_geog_gix ON airports USING GIST (geog);
CREATE INDEX IF NOT EXISTS airports_geom_gix ON airports USING GIST (geom);

-- (опционально) уникальность ICAO, если нужна
CREATE UNIQUE INDEX IF NOT EXISTS airports_icao_uq ON airports (icao);
