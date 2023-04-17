export const buildQueryResponses = (numOfResults, cursor = 1) => {
  const responses = [];
  for (let i = cursor; i < numOfResults + 1; i++) {
    responses.push({
      _source: {
        id: `http://test.org/${i}`,
        type: "Concept",
        prefLabel: {
          en: `Test ${i} EN`,
          de: `Test ${i} DE`,
        },
        definition: {
          en: `Definition ${i} EN`,
          de: `Definition ${i} DE`,
        },
        scopeNote: {
          en: `Scope Note ${i} EN`,
          de: `Scope Note ${i} DE`,
        },
      },
    });
  }
  return {
    responses: [
      {
        hits: {
          hits: responses,
        },
      },
    ],
  };
};
