import React from "react";

interface LoadingStateProps {
  message: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message }) => {
  return (
    <div className="flex items-center justify-center py-6">
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
};

interface EmptyStateProps {
  message: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ message }) => {
  return (
    <div className="flex m-4 items-center justify-center h-full text-gray-500">
      {message}
    </div>
  );
};
