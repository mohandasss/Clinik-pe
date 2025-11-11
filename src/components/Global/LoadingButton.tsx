import { useState } from "react";
import { Button,  type ButtonProps } from "@mantine/core";

type LoadingButtonProps = ButtonProps & {
  onClick: () => Promise<void> | void;
};

export function LoadingButton({ onClick, children, ...rest }: LoadingButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    await onClick();
    setLoading(false);
  };

  return (
    <Button loading={loading} onClick={handleClick} {...rest}>
      {children}
    </Button>
  );
}
