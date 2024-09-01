declare module "xpath" {
  export function select(
    expression: string,
    node: Node,
    single?: boolean
  ): string | Node | Node[];
  export function select1(expression: string, node: Node): Node | null;
  export function evaluate(
    expression: string,
    node: Node,
    resolver?: XPathNSResolver
  ): XPathResult;
}
