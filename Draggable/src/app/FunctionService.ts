export class FunctionService {
    async getAll(): Promise<any> {
        const promise = new Promise((resolve, reject) => {
            const data = `
            [{
                "name": "China",
                "id": 15
              }, {
                "name": "Israel",
                "id": 16
              }, {
                "name": "India",
                "id": 17
              }, {
                "name": "United States",
                "id": 18
              }, {
                "name": "United Kingdom",
                "id": 19
              }]
              `;
            resolve(JSON.parse(data));
        });
        return promise;
    }
}
