import React from 'react';

export default function RelevansiPkmLayout({
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
