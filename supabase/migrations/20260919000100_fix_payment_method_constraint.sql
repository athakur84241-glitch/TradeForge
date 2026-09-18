alter table public.orders
  drop constraint if exists orders_payment_method_check;

alter table public.orders
  add constraint orders_payment_method_check
  check (
    payment_method is null
    or payment_method in (
      'USDT_TRC20',
      'USDT_ERC20',
      'USDT_SOLANA',
      'USDC_ERC20',
      'SOL_SOLANA'
    )
  );