export default {
  responses: [
    {
      hits: {
        hits: [
          {
            _source: {
              id: "http://test.org/1",
              prefLabel: {
                en: "Test EN",
                de: "Test DE",
              },
              definition: {
                en: "Definition EN",
                de: "Definition DE",
              },
              scopeNote: {
                en: "Scope Note EN",
                de: "Scope Note DE",
              },
            },
          },
        ],
      },
    },
  ],
};
