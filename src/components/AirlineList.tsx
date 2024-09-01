import React, { useState, useEffect } from "react";
import { DOMParser, XMLSerializer } from "xmldom";
import xpath from "xpath";

// TypeScript Interface Definition
// This defines the shape of an Airline object in TypeScript.
// It specifies that an Airline must have three properties: name, country, and type, all of which are strings.
// This helps catch errors if we try to use an Airline object without one of these properties.
interface Airline {
  name: string;
  country: string;
  type: string;
}

// TypeScript Type Alias
// This creates a new type called SortKey, which can only be one of the three string values listed.
// It's used to ensure that we only sort by valid keys (name, country, or type).
type SortKey = "name" | "country" | "type";

// React Functional Component
// The ": React.FC" part is a TypeScript type annotation specifying that this is a React Functional Component.
const AirlineList: React.FC = () => {
  // useState hooks with TypeScript
  // The <Airline[]> syntax specifies that airlines will be an array of Airline objects.
  // This helps TypeScript provide better autocomplete and catch errors if we try to use airlines incorrectly.
  const [airlines, setAirlines] = useState<Airline[]>([]);

  // The <Document | null> syntax allows xmlDoc to be either a Document object or null.
  const [xmlDoc, setXmlDoc] = useState<Document | null>(null);

  // This initializes newAirline with an object that matches the Airline interface.
  const [newAirline, setNewAirline] = useState<Airline>({
    name: "",
    country: "",
    type: "",
  });

  // These specify that sortKey must be a SortKey type, and sortDirection must be either "asc" or "desc".
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const response = await fetch("./AirlineData.xml");
        const xmlData = await response.text();

        // XML Parsing
        // This creates a new DOMParser object, which can parse XML strings into DOM objects.
        const parser = new DOMParser();
        // This parses the XML string into a Document object, which represents the entire XML document.
        const doc = parser.parseFromString(xmlData, "text/xml");
        setXmlDoc(doc);

        updateAirlineList(doc);
      } catch (error) {
        console.error("Error fetching or parsing XML:", error);
      }
    };

    fetchData();
  }, []);

  const updateAirlineList = (doc: Document) => {
    // XPath Usage
    // This XPath expression "//airline" selects all 'airline' elements in the document, regardless of their position.
    // The '//' means "search the entire document for elements named 'airline'".
    const airlineNodes = xpath.select("//airline", doc) as Node[];

    // This maps over each selected Node, extracting data using more specific XPath expressions.
    const airlineData: Airline[] = airlineNodes.map((node) => ({
      // This XPath expression selects the text content of the 'name' child element of the current 'airline' element.
      // The '.' at the start means "start from the current node (an 'airline' element)".
      // The '/text()' at the end selects the text content of the selected element.
      name: xpath.select1("./name/text()", node)?.nodeValue || "Unknown",
      country: xpath.select1("./country/text()", node)?.nodeValue || "Unknown",
      type: xpath.select1("./type/text()", node)?.nodeValue || "Unknown",
    }));

    setAirlines(airlineData);
  };

  // Event handler with TypeScript
  // This specifies that the event 'e' is a change event from either an input or select element.
  // It allows TypeScript to know what properties and methods are available on 'e' and 'e.target'.
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    // This uses the spread operator (...) to create a new object based on the previous state,
    // updating only the property that matches the input's 'name'.
    // The [name] syntax is using computed property names to dynamically set the property.
    setNewAirline((prev) => ({ ...prev, [name]: value }));
  };

  // Event handler for form submission
  // This specifies that 'e' is a form submission event.
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (xmlDoc) {
      // XML Manipulation
      // These lines create new XML elements and set their text content.
      const newAirlineElement = xmlDoc.createElement("airline");
      const nameElement = xmlDoc.createElement("name");
      const countryElement = xmlDoc.createElement("country");
      const typeElement = xmlDoc.createElement("type");

      nameElement.textContent = newAirline.name;
      countryElement.textContent = newAirline.country;
      typeElement.textContent = newAirline.type;

      // This appends the new elements to create the structure:
      // <airline>
      //   <name>...</name>
      //   <country>...</country>
      //   <type>...</type>
      // </airline>
      newAirlineElement.appendChild(nameElement);
      newAirlineElement.appendChild(countryElement);
      newAirlineElement.appendChild(typeElement);

      // This adds the new airline element to the root of the XML document.
      const airlinesElement = xmlDoc.documentElement;
      airlinesElement.appendChild(newAirlineElement);

      updateAirlineList(xmlDoc);
      setNewAirline({ name: "", country: "", type: "" });

      // XML Serialization
      // This converts the XML Document object back into a string representation.
      const serializer = new XMLSerializer();
      console.log(serializer.serializeToString(xmlDoc));
    }
  };

  // Event handler for sorting
  // This specifies that the 'key' parameter must be of type SortKey.
  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      // This uses a ternary operator to toggle the sort direction.
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  // Sorting logic
  // This creates a new sorted array based on the current sort key and direction.
  // The '<Airline>' type parameter ensures type safety when sorting.
  const sortedAirlines = [...airlines].sort((a: Airline, b: Airline) => {
    if (a[sortKey] < b[sortKey]) return sortDirection === "asc" ? -1 : 1;
    if (a[sortKey] > b[sortKey]) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">
        Airlines
      </h1>

      {/* Add Airline Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
      >
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="name"
          >
            Airline Name
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="name"
            type="text"
            name="name"
            value={newAirline.name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="country"
          >
            Country
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="country"
            type="text"
            name="country"
            value={newAirline.country}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="type"
          >
            Type
          </label>
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="type"
            name="type"
            value={newAirline.type}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Type</option>
            <option value="Commercial">Commercial</option>
            <option value="Low-cost">Low-cost</option>
            <option value="Cargo">Cargo</option>
          </select>
        </div>
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Add Airline
          </button>
        </div>
      </form>

      {/* Sort Buttons */}
      <div className="mb-4 flex space-x-2">
        <button
          onClick={() => handleSort("name")}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
        >
          Sort by Name{" "}
          {sortKey === "name" && (sortDirection === "asc" ? "▲" : "▼")}
        </button>
        <button
          onClick={() => handleSort("country")}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
        >
          Sort by Country{" "}
          {sortKey === "country" && (sortDirection === "asc" ? "▲" : "▼")}
        </button>
        <button
          onClick={() => handleSort("type")}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
        >
          Sort by Type{" "}
          {sortKey === "type" && (sortDirection === "asc" ? "▲" : "▼")}
        </button>
      </div>

      {/* Airline List */}
      <ul className="bg-white shadow-md rounded-lg overflow-hidden">
        {sortedAirlines.map((airline, index) => (
          <li
            key={index}
            className="px-6 py-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors duration-200"
          >
            <span className="font-semibold">{airline.name}</span>
            <span className="text-gray-500 ml-2">- {airline.country}</span>
            <span className="text-gray-400 ml-2">({airline.type})</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AirlineList;
