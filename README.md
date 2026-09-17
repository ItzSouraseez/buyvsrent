# Buy vs Rent — India

Neo-Brutalist Next.js implementation of the supplied Buy vs Rent spreadsheet.

## Run
```bash
npm install
npm run dev
```

Then open http://localhost:3000

## Model
The calculator reproduces the workbook's core mechanics:
- Loan amount = property price × (1 - down payment)
- EMI using the standard PMT formula
- Initial cash = down payment + transaction costs
- Property appreciation
- Loan amortization
- Annual maintenance + property tax/insurance
- Rent escalation
- Annual rent-vs-buy cash-flow difference
- Rent-side investment portfolio compounding
- Final comparison = rent portfolio vs home equity

The workbook's salary-growth and inflation inputs are not used by its formulas, so they are deliberately not included as active calculation inputs.
