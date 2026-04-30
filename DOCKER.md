# Docker Setup - Job Tracker

## Запуск через Docker

### 1. Собрать и запустить
```bash
docker-compose up --build -d
```

### 2. Доступ к приложению
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

### 3. Остановить
```bash
docker-compose down
```

## Доступ с других устройств в локальной сети

### Найти IP компьютера:
**Windows:**
```cmd
ipconfig
```
Ищи `IPv4 Address` (например: `192.168.1.100`)

**Linux/Mac:**
```bash
ipconfig getifaddr en0
# или
hostname -I
```

### Подключиться с другого устройства:
Замени `localhost` на IP компьютера:
- http://192.168.1.100:3000

## Настройка API URL для внешнего доступа

Для доступа извне нужно указать правильный API URL.

### Вариант 1: Редактировать docker-compose.yml
```yaml
client:
  environment:
    - NEXT_PUBLIC_API_URL=http://192.168.1.100:5000/auth
```

### Вариант 2: Использовать .env файл
Создай `.env` в корне:
```
NEXT_PUBLIC_API_URL=http://192.168.1.100:5000/auth
```

Пересобери контейнеры:
```bash
docker-compose down
docker-compose up --build -d
```

## Проверка работы

1. Открой http://localhost:3000 на компьютере
2. Открой http://[IP]:3000 на телефоне/планшете
3. Оба должны работать!

## Проблемы и решения

### CORS ошибки
Проверь что в server/src/server.js CORS разрешён:
```javascript
app.use(cors({ origin: '*' }));
```

### API не доступен
Проверь что сервер запущен:
```bash
docker logs job-tracker-server
```

### Не работает drag-and-drop на мобильных
Убедись что viewport настроен в layout.tsx
