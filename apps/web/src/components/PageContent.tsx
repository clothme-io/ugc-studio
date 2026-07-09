export function PageContent({
  children,
  maxWidth = '3xl',
}: {
  children: React.ReactNode;
  maxWidth?: '2xl' | '3xl' | '4xl' | '5xl';
}) {
  const widthClass =
    maxWidth === '2xl'
      ? 'max-w-2xl'
      : maxWidth === '5xl'
        ? 'max-w-5xl'
        : maxWidth === '4xl'
          ? 'max-w-4xl'
          : 'max-w-3xl';

  return <div className={`mx-auto ${widthClass} p-8`}>{children}</div>;
}
