import dynamic from "next/dynamic";
import { ComponentType } from "react";

/// Higher order component to prevent server-side rendering, useful for components that use dependencies
/// that rely on client side code.
const withNoSSR = <T extends ComponentType<any>>(component: T) =>
  dynamic(() => Promise.resolve(component), { ssr: false });

export default withNoSSR;
