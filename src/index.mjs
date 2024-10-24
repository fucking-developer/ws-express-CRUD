import express, { response } from "express";
import mongoose from "mongoose";

const mockUsers = mongoose.model('moguito2', new mongoose.Schema({
    username: String,
    displayName: String
}))
  

/*
const mockUsers = [
    {id: 1, username: "anson", displayName: "Anson"},
    {id: 2, username: "jack", displayName: "Jack"},
    {id: 3, username: "adam", displayName: "Adam"},
    {id: 4, username: "tina", displayName: "Tina"},
    {id: 5, username: "jason", displayName: "Jason"},
    {id: 6, username: "henry", displayName: "Henry"},
    {id: 7, username: "marilyn", displayName: "Marilyn"}
];
*/

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000

mongoose.connect('mongodb://nico:12345678@127.0.0.1:8083/miapp?authSource=admin')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB', err));


app.get("/", (request, response) => {
    response.status(201).send({msg: "Hello...!"});
})

app.get("/api/users", async (request, response) =>{
    /*console.log(request.query)

    const{
        query: {filter, value},
    } = request;
    //if (!filter && !value) return response.send(mockUsers);
    if (filter && value)
        return response.send(
            mockUsers.filter((user) => user[filter].includes(value))
        );
    return response.send(mockUsers);*/
    const users = await mockUsers.find();
    return response.send(users)
});

app.post("/api/users", async(request, response) => {
    /*//console.log(request.body)
    const { body } = request;
    const newUser = {id: mockUsers[mockUsers.length -1].id + 1, ...body };
    //mockUsers.push(newUser);
    const nuevo = new mockUsers(newUser);
    await nuevo.save();
    return response.send(newUser);*/
    const {body} = request;
    await mockUsers.create(body);
    return response.send('ok');
})

app.get("/api/users/:id", async(request, response) =>{
    //console.log(request.params)
    /*const parseId = parseInt(request.params.id)
    if (isNaN(parseId))
        return response.status(400).send({ msg: "Bad Request. Invalid ID."});
    const findUser = mockUsers.find((user) => user.id === parseId);
    if (!findUser) return response.sendStatus(404);
    return response.send(findUser);*/
    const user = await findUserById(request.params.id, response);
    if(user){
        response.send(user)
    }
});

app.put("/api/users/:id", async(request, response) => {
    /*const {
        body, 
        params: { id},
    } = request;
    const parseId = parseInt(id);
    if(isNaN(parseId)) return response.sendStatus(400);
    const findUserIndex = mockUsers.findIndex((user) => user.id === parseId); 
    if (findUserIndex === -1) return response.sendStatus(404);
    mockUsers[findUserIndex] = { id: parseId, ...body};
    return response.sendStatus(200);*/
    const user = await findUserById(request.params.id, response);
    if (user) {
        Object.assign(user, request.body);
        await user.save();
        response.send({ msg: "User updated", user });
    }
});

app.delete("/api/users/:id", async(request, response) => {
    /*const {
        params: {id},
    } = request;
    const parseId = parseInt(id);
    if (isNaN(parseId)) return response.sendStatus(400);
    const findUserIndex = mockUsers.findIndex((user) => user.id === parseId);
    if (findUserIndex === -1 ) return response.sendStatus(404);
    mockUsers.splice(findUserIndex, 1);
    return response.sendStatus(200);*/
    const user = await findUserById(request.params.id, response);
    if (user) {
        await user.remove();
        response.send({ msg: "User deleted" });
    }
})



/*pendiente*/ 
app.get("/api/products", (request, response) =>{
    response.send([
        {id: 123, name: "chicken breast", price: 12.99}
    ]);
});

/*pendiente */
app.patch("/api/users/:id", (request, response) => {
    const {
        body,
        params: { id },
    } = request;
    const parseId = parseInt(id);
    if(isNaN(parseId)) return response.sendStatus(400);
    const findUserIndex = mockUsers.findIndex((user) => user.id === parseId);
    if(findUserIndex === -1) return response.sendStatus(404);
    mockUsers[findUserIndex] = {...mockUsers[findUserIndex], ...body};
    return response.sendStatus(200)
});

const findUserById = async (userId, response) => {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        response.status(400).send({ msg: "Invalid ID format." });
        return null;
    }

    try {
        const user = await mockUsers.findById(userId);
        if (!user) {
            response.status(404).send({ msg: "User not found." });
            return null;
        }
        return user;
    } catch (error) {
        console.error(error);
        response.status(500).send({ msg: "Server error." });
        return null;
    }
};

app.listen(PORT, () => {
    console.log(`Running on Port ${PORT}`);
});