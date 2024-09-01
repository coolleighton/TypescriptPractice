// This line declares a new module named "xpath".
// In TypeScript, this allows you to use import statements for this module
// and provides type checking for its exported functions.
declare module "xpath" {
  // This declares the 'select' function exported by the xpath module.
  export function select(
    // The first parameter is the XPath expression as a string.
    expression: string,
    // The second parameter is the context node to start the XPath query from.
    node: Node,
    // An optional boolean parameter. If true, it will return a single node instead of an array.
    single?: boolean
    // The return type can be either a string, a single Node, or an array of Nodes.
    // This flexibility allows for different types of XPath queries.
  ): string | Node | Node[];

  // This declares the 'select1' function, which is meant to select a single node.
  export function select1(
    // The XPath expression to evaluate.
    expression: string,
    // The context node to start the XPath query from.
    node: Node
    // It returns either a single Node or null if no node is found.
  ): Node | null;

  // This declares the 'evaluate' function, which provides more detailed control over the XPath evaluation.
  export function evaluate(
    // The XPath expression to evaluate.
    expression: string,
    // The context node to start the XPath query from.
    node: Node,
    // An optional XPath namespace resolver.
    // This is used when the XML contains namespaces.
    resolver?: XPathNSResolver
    // It returns an XPathResult object, which contains the result of the evaluation.
    // XPathResult is a more complex object defined in the DOM standard.
  ): XPathResult;
}

// Note: The Node, XPathNSResolver, and XPathResult types are not defined in this file.
// TypeScript expects these to be available in the global scope or imported from another module.
// They are typically provided by the DOM library or a separate type definition file.
