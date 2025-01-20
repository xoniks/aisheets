import { routeLoader$ } from "@builder.io/qwik-city";

interface Row {
  id: string;
  data: {
    [key: string]: {
      value: string;
      generating?: boolean;
    };
  };
}
export const useRowsLoader = routeLoader$<Row[]>(() => {
  return Promise.resolve([
    {
      id: "1",
      data: {
        expected_response: {
          value: "Expected 1",
        },
        query: {
          value: "what are discount points?",
        },
        context: {
          value:
            "Discount points, also called mortgage points or simply points, are a form of pre-paid interest available in the United States when arranging a mortgage. One point equals one percent of the loan amount. By charging a borrower points, a lender eff",
        },
        classify_query: {
          value: "finance",
        },
      },
    },
    {
      id: "2",
      data: {
        expected_response: {
          value: "Expected 2",
        },
        query: {
          value: "what is a credit score?",
        },
        context: {
          value:
            "A credit score is a numerical expression based on a level analysis of a person's credit files, to represent the creditworthiness of an individual.",
        },
        classify_query: {
          value: "finance",
        },
      },
    },
    {
      id: "3",
      data: {
        expected_response: {
          value: "Expected 3",
        },
        query: {
          value: "how to improve credit score?",
        },
        context: {
          value:
            "Improving your credit score involves paying bills on time, reducing debt, and maintaining a low balance on credit cards.",
        },
        classify_query: {
          value: "finance",
        },
      },
    },
    {
      id: "4",
      data: {
        expected_response: {
          value: "Expected 4",
        },
        query: {
          value: "what is a mortgage?",
        },
        context: {
          value:
            "A mortgage is a loan used by individuals and businesses to make large real estate purchases without paying the entire value of the purchase up front.",
        },
        classify_query: {
          value: "finance",
        },
      },
    },
    {
      id: "5",
      data: {
        expected_response: {
          value: "Expected 5",
        },
        query: {
          value: "what is an interest rate?",
        },
        context: {
          value:
            "An interest rate is the amount a lender charges a borrower and is a percentage of the principal—the amount loaned.",
        },
        classify_query: {
          value: "finance",
        },
      },
    },
    {
      id: "6",
      data: {
        expected_response: {
          value: "Expected 6",
        },
        query: {
          value: "what is a loan?",
        },
        context: {
          value:
            "A loan is the act of giving money, property or other material goods to another party in exchange for future repayment of the principal amount along with interest or other finance charges.",
        },
        classify_query: {
          value: "finance",
        },
      },
    },
    {
      id: "7",
      data: {
        expected_response: {
          value: "Expected 7",
        },
        query: {
          value: "what is a savings account?",
        },
        context: {
          value:
            "A savings account is a deposit account held at a retail bank that pays interest but cannot be used directly as money in the narrow sense of a medium of exchange.",
        },
        classify_query: {
          value: "finance",
        },
      },
    },
    {
      id: "8",
      data: {
        expected_response: {
          value: "Expected 8",
        },
        query: {
          value: "what is a checking account?",
        },
        context: {
          value:
            "A checking account is a deposit account held at a financial institution that allows withdrawals and deposits.",
        },
        classify_query: {
          value: "finance",
        },
      },
    },
    {
      id: "9",
      data: {
        expected_response: {
          value: "Expected 9",
        },
        query: {
          value: "what is a certificate of deposit?",
        },
        context: {
          value:
            "A certificate of deposit (CD) is a savings certificate with a fixed maturity date and specified fixed interest rate.",
        },
        classify_query: {
          value: "finance",
        },
      },
    },
    {
      id: "10",
      data: {
        expected_response: {
          value: "Expected 10",
        },
        query: {
          value: "what is a bond?",
        },
        context: {
          value:
            "A bond is a fixed income instrument that represents a loan made by an investor to a borrower (typically corporate or governmental).",
        },
        classify_query: {
          value: "finance",
        },
      },
    },
    {
      id: "11",
      data: {
        expected_response: {
          value: "Expected 11",
        },
        query: {
          value: "what is a stock?",
        },
        context: {
          value:
            "A stock (also known as equity) is a security that represents the ownership of a fraction of a corporation.",
        },
        classify_query: {
          value: "finance",
        },
      },
    },
  ]);
});
