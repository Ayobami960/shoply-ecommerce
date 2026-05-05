import { Link, useNavigate, useSearchParams } from "react-router";
import { useCart } from "../store/cart";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { CheckCircle2Icon, PackageIcon, AlertCircleIcon } from "lucide-react";
import { apiFetch } from "../lib/api";
import { useAuth } from "@clerk/react";
import PageLoader from "../components/PageLoader";

function CheckoutReturnPage() {
  const clearCart = useCart((s) => s.clear);
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const [params] = useSearchParams();
  const checkoutId = params.get("checkout_id");

  const queryClient = useQueryClient();

  const [verifyState, setVerifyState] = useState("loading"); // loading | success | error
  const [errorMessage, setErrorMessage] = useState("");

  const verifyCheckout = async () => {
    try {
      setVerifyState("loading");
      
      if (!checkoutId) {
        setVerifyState("error");
        setErrorMessage("Missing checkout ID");
        return;
      }

      // Verify the checkout with the backend
      const result = await apiFetch(`/api/checkout/${checkoutId}`, { getToken });

      // Clear cart and invalidate orders query
      clearCart();
      queryClient.invalidateQueries({ queryKey: ["orders"] });

      setVerifyState("success");

      // Redirect to orders page after 1.2 seconds
      const timeout = window.setTimeout(() => {
        navigate("/orders", { replace: true });
      }, 1200);

      return () => window.clearTimeout(timeout);
    } catch (err) {
      // If order not found, might still be processing (webhook delay)
      if (err.message?.includes("not found")) {
        setVerifyState("error");
        setErrorMessage("Order is still processing. This usually takes a few seconds. You can retry or check your orders page.");
      } else {
        setVerifyState("error");
        setErrorMessage(err.message || "Failed to verify checkout. Please try again.");
      }
    }
  };

  useEffect(() => {
    verifyCheckout();
  }, [checkoutId, clearCart, navigate, queryClient, getToken]);

  if (verifyState === "loading") {
    return <PageLoader />;
  }

  if (verifyState === "error") {
    const handleBackToCart = () => {
      clearCart();
      navigate("/cart", { replace: true });
    };

    const handleViewOrders = () => {
      clearCart();
      navigate("/orders", { replace: true });
    };

    return (
      <div className="mx-auto max-w-lg text-center">
        <div className="avatar placeholder mx-auto mb-4">
          <div className="w-16 rounded-full bg-warning/20 text-warning flex items-center justify-center">
            <AlertCircleIcon className="size-10" aria-hidden />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-base-content">Payment Processing</h1>

        <p className="mt-4 text-base-content/70">
          {errorMessage}
        </p>

        {checkoutId ? (
          <p className="mt-2 font-mono text-xs text-base-content/50">Checkout: {checkoutId}</p>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 justify-center">
          <button 
            onClick={verifyCheckout}
            className="btn btn-primary gap-2"
          >
            Retry Verification
          </button>
          <div className="flex gap-3">
            <button onClick={handleBackToCart} className="btn btn-outline flex-1">
              Back to Cart
            </button>
            <button 
              onClick={handleViewOrders}
              className="btn btn-ghost flex-1 gap-2"
            >
              <PackageIcon className="size-4" aria-hidden />
              View Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg text-center">
      <div className="avatar placeholder mx-auto mb-4">
        <div className="w-16 rounded-full bg-success/20 text-success flex items-center justify-center">
          <CheckCircle2Icon className="size-10" aria-hidden />
        </div>
      </div>

      <h1 className="text-2xl font-bold text-base-content">Thanks for your order</h1>

      <p className="mt-4 text-base-content/70">
        Your order is created and confirmed. You are being redirected to your orders list.
      </p>

      {checkoutId ? (
        <p className="mt-2 font-mono text-xs text-base-content/50">Checkout: {checkoutId}</p>
      ) : null}

      <Link to="/orders" className="btn btn-primary mt-8 gap-2">
        <PackageIcon className="size-4" aria-hidden />
        View orders
      </Link>
    </div>
  );
}

export default CheckoutReturnPage;
