export class OutputService {
    async getAll(): Promise<any> {
        const promise = new Promise((resolve, reject) => {
            const data = `
            [{
                "name": "China",
                "id": 1
              }, {
                "name": "Portugal",
                "id": 2
              }, {
                "name": "India",
                "id": 3
              }, {
                "name": "United States",
                "id": 4
              }, {
                "name": "United Kingdom",
                "id": 5
              }]
            `;
            resolve(JSON.parse(data));
        });
        return promise;
    }
}
