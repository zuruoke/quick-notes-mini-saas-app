.PHONY: up down logs ps db.migrate db.studio seed

up:
	docker compose up -d --build --wait

scale:
	docker compose up -d --scale api=2

down:
	docker compose down -v

logs:
	docker compose logs -f --tail=100

ps:
	docker compose ps

db.migrate:
	docker compose exec api npx prisma migrate deploy

db.studio:
	docker compose exec -it api npx prisma studio

seed:
	docker compose exec api node dist/seed.js