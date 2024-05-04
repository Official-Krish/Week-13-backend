import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign } from 'hono/jwt'
export const userRouter = new Hono<{
    Bindings:{
      DATABASE_URL : string,
      JWT_SECRET : string
    }
}>();


userRouter.post('/signup', async (c) => {
    const body = await c.req.json();
	const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());

	try {
		const user = await prisma.user.create({
			data: {
				username : body.username,
				password: body.password,
                name : body.name 
			}
		});
        console.log(user);
		const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
		return c.json({ jwt });
	} catch(e) {
		c.status(403);
		return c.json({ error: "error while signing up" });
	}
})



userRouter.post('/signin', async (c) => {
    const body = await  c.req.json();
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL	,
    }).$extends(withAccelerate());


  const user = await prisma.user.findUnique({
    where :{
      username : body.username,
      password : body.password
    }
  });
  if (!(user)){
    c.status(403);
    return c.json({ error: "error while signing in" });
  }else{
    const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
    return c.json({ jwt });
  }
})