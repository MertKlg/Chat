import path from "path"

let file = "/storage/7eccc441-828d-4ad7-aa08-5f99ae311e69/c45bffe6-907b-44cf-ad6a-bdf37219ba55.png"


describe.skip("Test file", () => {

test("Test file", () => {})

test("spliteFile", () => {
    const foundedFile = file.split("/").find(e => e.endsWith(".png"))?.trim()
    console.log("Founded file : ", foundedFile)
    expect(foundedFile)
})
})
