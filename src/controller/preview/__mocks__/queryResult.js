export default {
  hits: {
    total: {
      value: 1,
    },
    hits: [
      {
        _source: {
          id: "http://test.org/1",
          type: "Concept",
          inScheme: [
            {
              id: "http://test.org/scheme",
            },
          ],
          prefLabel: {
            en: "Test EN",
            de: "Test DE",
          },
          altLabel: {
            en: ["Alt Label 1 EN", "Alt Label 2 EN"],
            de: ["Alt Label 1 DE", "Alt Label 2 DE"],
          },
          definition: {
            en: "Definition EN",
            de: "Definition DE",
          },
          scopeNote: {
            en: "Scope Note EN",
            de: "Scope Note DE",
          },
          example: {
            en: ["Example 1 EN", "Example 2 EN"],
            de: ["Example 1 DE", "Example 2 DE"],
          },
          img: {
            url: "http://test.org/img.png",
            alt: "Test Image",
          }
        },
      },
    ],
  },
};
