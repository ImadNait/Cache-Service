import Elysia from 'elysia';
import { cachRoute } from './service/cache';

const PORT = process.env.PORT || 4000;

const app = new Elysia()
.get('/', () => {
    return new Response('WSUP');
})

.use(cachRoute)

.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

