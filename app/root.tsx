import React, { useState, useEffect } from "react"; // Import React and useState
import {
  Form,
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  NavLink,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import { getContacts, createEmptyContact } from "./data";
import type{  LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import appStyleHref from "./app.css";
import loadingSpinner from "./assets/Spinning arrows.gif"; // Import your SVG loading spinner image

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: appStyleHref },
];

export const action = async () => {
  const contact = createEmptyContact();
  return redirect(`/contacts/${(await contact).id}/edit`);
};

// export const loader = async () => {
//   const contacts = await getContacts();
//   return json({ contacts });
// };

export const loader = async ({
  request,
}: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const contacts = await getContacts(q);
  return json({ contacts,q });
};


export default function App() {
  const navigation = useNavigation();
  const submit = useSubmit();
  const { contacts,q } = useLoaderData<typeof loader>();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // Use the navigation state to determine if navigation is in progress
    setIsNavigating(navigation.state === "loading");
  }, [navigation]);

  useEffect(() => {
    const searchField = document.getElementById("q");
    if (searchField instanceof HTMLInputElement) {
      searchField.value = q || "";
    }
  }, [q]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div id="sidebar">
          <h1>Remix Contacts</h1>
          <div>
            <Form id="search-form"
            onChange={(event) => {
              const isFirstSearch = q === null;
                submit(event.currentTarget, {
                  replace: !isFirstSearch,
                });
            }}
            role="search">
              <input
                id="q"
                defaultValue={q || ""}
                aria-label="Search contacts"
                placeholder="Search"
                type="search"
                name="q"
              />
              <div
                id="search-spinner"
                aria-hidden
                hidden={!isNavigating} // Show the spinner when navigating
              >
                <img src={loadingSpinner} alt="Loading..." width="32" height="32" />
              </div>
            </Form>
            <Form method="post">
              <button type="submit">New</button>
            </Form>
          </div>
          <nav>
            {contacts.length ? (
              <ul>
                {contacts.map((contact) => (
                  <li key={contact.id}>
                    <NavLink
                      className={({ isActive, isPending }) =>
                        isActive ? "active" : isPending ? "pending" : ""
                      }
                      to={`contacts/${contact.id}`}
                    >
                      <Link to={`contacts/${contact.id}`}>
                        {contact.first || contact.last ? (
                          <>
                            {contact.first} {contact.last}
                          </>
                        ) : (
                          <i>No Name</i>
                        )}{" "}
                        {contact.favorite ? <span>★</span> : null}
                      </Link>
                    </NavLink>
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                <i>No contacts</i>
              </p>
            )}
          </nav>
        </div>
        <div
          className={isNavigating ? "loading" : ""} // Add the "loading" class based on isNavigating
          id="detail"
        >
          <Outlet />
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
