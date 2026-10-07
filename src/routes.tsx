import type { RouteObject } from "react-router";

import { RootLayout, RootError, NotFound } from "@/components/RootLayout";
import Index from "@/pages/Index";
import AppPage from "@/pages/App";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";

export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    errorElement: <RootError />,
    children: [
      { path: "/", element: <Index /> },
      { path: "/app", element: <AppPage /> },
      { path: "/signin", element: <SignIn /> },
      { path: "/signup", element: <SignUp /> },
      { path: "*", element: <NotFound /> },
    ],
  },
];
