// This line declares a new module.
// The "*.xml" syntax means this declaration applies to all files with a .xml extension.
declare module "*.xml" {
  // This line declares a constant named 'content' of type string.
  // It represents the content of the XML file.
  const content: string;

  // This line exports the 'content' constant as the default export of the module.
  export default content;
}
