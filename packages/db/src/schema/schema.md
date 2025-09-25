# Схема БД (AirlineSim)

Документ описывает таблицы и связи, определённые в `packages/db/src/schema`.

## Общие замечания

- Везде используется `uuid` как первичный ключ (`primaryKey()`), даты — `timestamp with time zone` c `default now()`.
- Названия столбцов в БД приведены в скобках после имени поля.
- Указаны уникальные индексы, обычные индексы и внешние ключи с политикой удаления.

---

## airlines — Авиакомпании

Назначение: справочник авиакомпаний.

Поля:

- `id` (`id`, uuid) — PK, `defaultRandom()`.
- `name` (`name`, varchar(120)) — NOT NULL.
- `iata` (`iata`, varchar(2)) — NULL.
- `icao` (`icao`, varchar(3)) — NOT NULL.
- `createdAt` (`created_at`, timestamptz) — NOT NULL, `default now()`.

Индексы и ограничения:

- `airlines_icao_uq` — UNIQUE(`icao`).

Связи:

- 1 → N `aircraft` по `aircraft.airline_id` (ON DELETE CASCADE).
- 1 → N `routes` по `routes.airline_id` (ON DELETE CASCADE).

---

## airports — Аэропорты

Назначение: справочник аэропортов.

Поля:

- `id` (`id`, uuid) — PK, `defaultRandom()`.
- `iata` (`iata`, varchar(3)) — NOT NULL.
- `icao` (`icao`, varchar(4)) — NULL.
- `name` (`name`, varchar(120)) — NOT NULL.
- `timezone` (`timezone`, varchar(64)) — NOT NULL.
- `createdAt` (`created_at`, timestamptz) — NOT NULL, `default now()`.

Индексы и ограничения:

- `airports_iata_uq` — UNIQUE(`iata`).

Связи:

- 1 → N `routes` как `originRoutes` по `routes.origin_airport_id`.
- 1 → N `routes` как `destinationRoutes` по `routes.destination_airport_id`.

---

## aircraft_types — Типы воздушных судов

Назначение: справочник типов ВС и их компоновок.

Поля:

- `id` (`id`, uuid) — PK, `defaultRandom()`.
- `name` (`name`, varchar(120)) — NOT NULL.
- `icao` (`icao`, varchar(4)) — NOT NULL.
- `iata` (`iata`, varchar(3)) — NULL.
- `seatsEconomy` (`seats_economy`, int) — NOT NULL.
- `seatsBusiness` (`seats_business`, int) — NOT NULL, `default 0`.
- `seatsFirst` (`seats_first`, int) — NOT NULL, `default 0`.
- `createdAt` (`created_at`, timestamptz) — NOT NULL, `default now()`.

Индексы и ограничения:

- `aircraft_types_icao_uq` — UNIQUE(`icao`).

Связи:

- 1 → N `aircraft` по `aircraft.type_id`.

---

## aircraft — Борты авиакомпаний

Назначение: конкретные самолёты в парке авиакомпаний.

Поля:

- `id` (`id`, uuid) — PK, `defaultRandom()`.
- `airlineId` (`airline_id`, uuid) — NOT NULL, FK → `airlines.id` (ON DELETE CASCADE).
- `typeId` (`type_id`, uuid) — NOT NULL, FK → `aircraft_types.id`.
- `tailNumber` (`tail_number`, varchar(16)) — NOT NULL.
- `inService` (`in_service`, boolean) — NOT NULL, `default true`.
- `createdAt` (`created_at`, timestamptz) — NOT NULL, `default now()`.

Индексы и ограничения:

- `aircraft_tail_uq` — UNIQUE(`tail_number`).
- FK(`airline_id`) → `airlines(id)` ON DELETE CASCADE.
- FK(`type_id`) → `aircraft_types(id)`.

Связи:

- N → 1 `airlines` по `airline_id`.
- N → 1 `aircraft_types` по `type_id`.
- 1 → N `flights` по `flights.aircraft_id`.

---

## routes — Маршруты

Назначение: маршрут авиакомпании между парами аэропортов.

Поля:

- `id` (`id`, uuid) — PK, `defaultRandom()`.
- `airlineId` (`airline_id`, uuid) — NOT NULL, FK → `airlines.id` (ON DELETE CASCADE).
- `originAirportId` (`origin_airport_id`, uuid) — NOT NULL, FK → `airports.id`.
- `destinationAirportId` (`destination_airport_id`, uuid) — NOT NULL, FK → `airports.id`.
- `distanceKm` (`distance_km`, int) — NULL.
- `blockTimeMin` (`block_time_min`, int) — NULL.
- `createdAt` (`created_at`, timestamptz) — NOT NULL, `default now()`.

Индексы и ограничения:

- `routes_airline_origin_dest_uq` — UNIQUE(`airline_id`, `origin_airport_id`, `destination_airport_id`).
- FK(`airline_id`) → `airlines(id)` ON DELETE CASCADE.
- FK(`origin_airport_id`) → `airports(id)`.
- FK(`destination_airport_id`) → `airports(id)`.

Связи:

- N → 1 `airlines` по `airline_id`.
- N → 1 `airports` как `origin` по `origin_airport_id`.
- N → 1 `airports` как `destination` по `destination_airport_id`.
- 1 → N `schedules` по `schedules.route_id`.
- 1 → N `flights` по `flights.route_id`.

---

## schedules — Расписания рейсов

Назначение: повторяющиеся вылеты по маршруту.

Поля:

- `id` (`id`, uuid) — PK, `defaultRandom()`.
- `routeId` (`route_id`, uuid) — NOT NULL, FK → `routes.id` (ON DELETE CASCADE).
- `dowMask` (`dow_mask`, int) — NOT NULL. Битовая маска дней недели (например, 1 — пн, 2 — вт и т.д.; комбинации — сумма).
- `departureMinutes` (`departure_minutes`, int) — NOT NULL. Минуты от полуночи (локального времени/правила проекта).
- `basePrice` (`base_price`, numeric(12,2)) — NOT NULL. Базовый тариф.
- `createdAt` (`created_at`, timestamptz) — NOT NULL, `default now()`.

Индексы и ограничения:

- `schedules_route_idx` — INDEX(`route_id`).
- FK(`route_id`) → `routes(id)` ON DELETE CASCADE.

Связи:

- N → 1 `routes` по `route_id`.
- 1 → N `flights` по `flights.schedule_id`.

---

## flights — Рейсы (экземпляры)

Назначение: конкретные выполненные/планируемые рейсы на дату и время.

Поля:

- `id` (`id`, uuid) — PK, `defaultRandom()`.
- `scheduleId` (`schedule_id`, uuid) — NULL, FK → `schedules.id`. Может отсутствовать для нерегулярных рейсов.
- `routeId` (`route_id`, uuid) — NOT NULL, FK → `routes.id` (ON DELETE CASCADE).
- `aircraftId` (`aircraft_id`, uuid) — NOT NULL, FK → `aircraft.id`.
- `departureUtc` (`departure_utc`, timestamptz) — NOT NULL.
- `arrivalUtc` (`arrival_utc`, timestamptz) — NOT NULL.
- `status` (`status`, varchar(24)) — NOT NULL, `default 'scheduled'`.
- `totalEconomy` (`total_economy`, int) — NOT NULL, `default 0`.
- `soldEconomy` (`sold_economy`, int) — NOT NULL, `default 0`.
- `revenueEconomy` (`revenue_economy`, numeric(12,2)) — NOT NULL, `default 0`.
- `totalBusiness` (`total_business`, int) — NOT NULL, `default 0`.
- `soldBusiness` (`sold_business`, int) — NOT NULL, `default 0`.
- `revenueBusiness` (`revenue_business`, numeric(12,2)) — NOT NULL, `default 0`.
- `totalFirst` (`total_first`, int) — NOT NULL, `default 0`.
- `soldFirst` (`sold_first`, int) — NOT NULL, `default 0`.
- `revenueFirst` (`revenue_first`, numeric(12,2)) — NOT NULL, `default 0`.
- `createdAt` (`created_at`, timestamptz) — NOT NULL, `default now()`.

Индексы и ограничения:

- `flights_route_dep_idx` — INDEX(`route_id`, `departure_utc`).
- FK(`schedule_id`) → `schedules(id)`.
- FK(`route_id`) → `routes(id)` ON DELETE CASCADE.
- FK(`aircraft_id`) → `aircraft(id)`.

Связи:

- N → 1 `routes` по `route_id`.
- N → 1 `schedules` по `schedule_id` (необязательная связь).
- N → 1 `aircraft` по `aircraft_id`.

---

## Глобальная картина связей (кратко)

- `airlines` —(1:N)→ `aircraft` —(1:N)→ `flights`.
- `airlines` —(1:N)→ `routes` —(1:N)→ `schedules` —(1:N)→ `flights`.
- `airports` —(1:N)→ `routes` как `origin` и как `destination`.
- `aircraft_types` —(1:N)→ `aircraft`.

