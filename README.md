# FullHouse

## Quick Start:

**With Docker:**

To run this project locally you can use docker compose provided in the repository.

Clone the repository

```
git clone https://gitlab.lrz.de/seba-master-2024/team-15/prototype.git
```

CD into the project directory and run the following command:

```
docker compose up -d
```

Ensure that the containers are up and running:

```
docker compose ps
```

If you make changes to the Dockerfile or dependencies, rebuild the containers with:

```
docker compose up --build -d
```

**Without Docker:**

Build and start the the backend service:

```
cd ./backend
npm i
npm start
```

Build and start the frontend service:

```
cd ./frontend
npm i
npm start
```

**Open application in browser:**

```
http://localhost:3000/
```

## Parameters:

Parameters, API keys, etc. are available under:

```
./backend/.env
```

## The Stripe demo card is:

    4242 4242 4242 4242 | 123 | 1225

All payment intents are automatically accepted in test mode (Don't use your own credit Card).

## Verfication:

We use https://withpersona.com to verify out customers. Since it would cost 350€ Monthly to set up "real" verification, we are using the test mode, which works like the real verification process, but automatically accepts the verification.

### Team Members:

- Ole Raue
- Jan Kuwert
- Leon Cena
- Simon Leiner

## Languages & Tools:

- [Node](https://nodejs.org/en/)
- [Express](https://expressjs.com/)
- [Mongoose](https://mongoosejs.com/)
- [React](https://reactjs.org/)
- [MongoDB](https://www.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)
