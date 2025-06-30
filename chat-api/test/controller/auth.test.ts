import bcrypt from "bcrypt"

test("compare password", async() => {
    const result = await bcrypt.compare("12345678Test@?", "$2b$08$brX0vUOvTaJyt5y3ffCufOqo7nQVDwrilkRb32lkMsiRbJERwQ3zi")

    console.log(result)
})