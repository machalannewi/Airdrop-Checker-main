
function Transactions() {
  return (
    <div className="transactions">
      <h2>Transactions</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>2023-10-01</td>
            <td>$100</td>
            <td>Completed</td>
          </tr>
          <tr>
            <td>2023-10-04</td>
            <td>$100</td>
            <td>Pending</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
export default Transactions;