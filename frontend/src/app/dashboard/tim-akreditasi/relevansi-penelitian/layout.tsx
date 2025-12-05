import React from 'react';

export default function RelevansiPenelitianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col flex-grow">
      {children}
    </div>
  );
}
