export default function CreditCardPage() {
  return (
    <form>
      <input type="text" autoComplete="cc-number" />
      <input type="text" autoComplete="cc-name" />
      <input type="text" autoComplete="cc-exp" />
      <input type="text" autoComplete="cc-csc" />
    </form>
  );
}
