import React from "react";
import * as _Builtin from "./_Builtin";
import * as _utils from "./utils";
import _styles from "./AdminNav.module.css";

export function AdminNav({ as: _Component = _Builtin.Block }) {
  return (
    <_Component className={_utils.cx(_styles, "admin-nav-bar")} tag="div">
      <_Builtin.Block className={_utils.cx(_styles, "admin-founder")} tag="div">
        <_Builtin.Block
          className={_utils.cx(_styles, "founder-icon-div")}
          tag="div"
        >
          <_Builtin.Image
            className={_utils.cx(_styles, "admin-founder-image")}
            loading="lazy"
            width="auto"
            height="auto"
            id="founder-profile"
            src="https://uploads-ssl.webflow.com/64548f6f8feacfafa79c9592/645f08315a0001a9b5c9c81c_Screenshot%202023-05-13%20at%2010.45.59.png"
          />
          <_Builtin.Block tag="div">
            <_Builtin.Heading
              className={_utils.cx(_styles, "heading", "no-bottom-margin")}
              tag="h1"
              id="founder-name"
            >
              {"Founder Name"}
            </_Builtin.Heading>
            <_Builtin.Block
              className={_utils.cx(_styles, "eth-address")}
              tag="div"
              id="founder-eth"
            >
              {"0x..."}
            </_Builtin.Block>
          </_Builtin.Block>
        </_Builtin.Block>
        <_Builtin.Block className={_utils.cx(_styles, "admin-links")} tag="div">
          <_Builtin.Link
            className={_utils.cx(_styles, "admin-link")}
            button={false}
            options={{
              href: "#",
            }}
          >
            {"Share update"}
            <_Builtin.Span className={_utils.cx(_styles, "arrow-diagonal")}>
              {"↗"}
            </_Builtin.Span>
          </_Builtin.Link>
          <_Builtin.Link
            className={_utils.cx(_styles, "admin-link")}
            button={false}
            options={{
              href: "#",
            }}
          >
            {"Projects "}
            <_Builtin.Span className={_utils.cx(_styles, "arrow-diagonal")}>
              {"↗"}
            </_Builtin.Span>
          </_Builtin.Link>
          <_Builtin.Link
            className={_utils.cx(_styles, "admin-link")}
            button={false}
            options={{
              href: "#",
            }}
          >
            {"Edit profile "}
            <_Builtin.Span className={_utils.cx(_styles, "arrow-diagonal")}>
              {"↗"}
            </_Builtin.Span>
          </_Builtin.Link>
        </_Builtin.Block>
      </_Builtin.Block>
    </_Component>
  );
}
