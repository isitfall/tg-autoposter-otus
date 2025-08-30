#!/bin/bash

echo "🔐 Тестирование API авторизации"
echo "================================"

BASE_URL="http://localhost:3000"

# Проверяем, что сервер запущен
echo "1. Проверяем доступность сервера..."
if curl -s $BASE_URL > /dev/null; then
    echo "✅ Сервер доступен на localhost:3000"
else
    echo "❌ Сервер недоступен. Запустите: npm run start:dev"
    exit 1
fi

echo ""
echo "2. Тестируем регистрацию пользователя..."
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","firstName":"Тест","lastName":"Пользователь"}')

if echo "$REGISTER_RESPONSE" | grep -q "access_token"; then
    echo "✅ Регистрация успешна"
    # Извлекаем токен
    TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
    echo "🔑 Получен токен: ${TOKEN:0:20}..."
else
    echo "❌ Ошибка регистрации: $REGISTER_RESPONSE"
    exit 1
fi

echo ""
echo "3. Тестируем вход в систему..."
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}')

if echo "$LOGIN_RESPONSE" | grep -q "access_token"; then
    echo "✅ Вход успешен"
    # Обновляем токен
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
    echo "🔑 Обновлен токен: ${TOKEN:0:20}..."
else
    echo "❌ Ошибка входа: $LOGIN_RESPONSE"
    exit 1
fi

echo ""
echo "4. Тестируем защищенный маршрут профиля..."
PROFILE_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" $BASE_URL/auth/profile)

if echo "$PROFILE_RESPONSE" | grep -q "email"; then
    echo "✅ Профиль получен успешно"
    echo "📋 Данные профиля: $PROFILE_RESPONSE"
else
    echo "❌ Ошибка получения профиля: $PROFILE_RESPONSE"
fi

echo ""
echo "5. Тестируем доступ без токена..."
UNAUTHORIZED_RESPONSE=$(curl -s -w "%{http_code}" $BASE_URL/auth/profile)
HTTP_CODE=$(echo "$UNAUTHORIZED_RESPONSE" | tail -c4)
RESPONSE_BODY=$(echo "$UNAUTHORIZED_RESPONSE" | head -c-4)

if [ "$HTTP_CODE" = "401" ]; then
    echo "✅ Защита работает: получен код 401"
else
    echo "❌ Проблема с защитой: получен код $HTTP_CODE"
fi

echo ""
echo "🎉 Тестирование завершено!"
echo "Для тестирования через браузер откройте: $BASE_URL"

