// Import necessary dependencies from React and other libraries
import React, { useState, useEffect } from "react";
import { DOMParser, XMLSerializer } from "xmldom";
import xpath from "xpath";

// Define the structure of an Airline object
interface Airline {
  name: string;
  country: string;
  type: string;
}

// Define the possible keys for sorting airlines
type SortKey = "name" | "country" | "type";

// Define the AirlineList component as a functional component
const AirlineList: React.FC = () => {
  // State for storing the list of airlines
  const [airlines, setAirlines] = useState<Airline[]>([]);

  // State for storing the XML document
  const [xmlDoc, setXmlDoc] = useState<Document | null>(null);

  // State for storing the details of a new airline being added
  const [newAirline, setNewAirline] = useState<Airline>({
    name: "",
    country: "",
    type: "",
  });

  // State for storing the current sort key
  const [sortKey, setSortKey] = useState<SortKey>("name");

  // State for storing the current sort direction
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // useEffect hook to fetch and parse XML data when the component mounts
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        // Fetch the XML file
        const response = await fetch("/AirlineData.xml");
        const xmlData = await response.text();

        // Parse the XML data into a Document object
        const parser = new DOMParser();
        const doc = parser.parseFromString(xmlData, "text/xml");
        setXmlDoc(doc);

        // Update the airline list with the parsed data
        updateAirlineList(doc);
      } catch (error) {
        console.error("Error fetching or parsing XML:", error);
      }
    };

    fetchData();
  }, []); // Empty dependency array means this effect runs once on mount

  // Function to update the airline list from the XML document
  const updateAirlineList = (doc: Document) => {
    // Select all 'airline' nodes from the XML using XPath
    const airlineNodes = xpath.select("//airline", doc) as Node[];

    // Map the XML nodes to Airline objects
    const airlineData: Airline[] = airlineNodes.map((node) => ({
      name: xpath.select1("name/text()", node)?.nodeValue || "Unknown",
      country: xpath.select1("country/text()", node)?.nodeValue || "Unknown",
      type: xpath.select1("type/text()", node)?.nodeValue || "Unknown",
    }));

    // Update the airlines state with the new data
    setAirlines(airlineData);
  };

  // Handler for input changes in the add airline form
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    // Update the newAirline state, keeping existing values and changing only the edited field
    setNewAirline((prev) => ({ ...prev, [name]: value }));
  };

  // Handler for form submission when adding a new airline
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (xmlDoc) {
      // Create new XML elements for the new airline
      const newAirlineElement = xmlDoc.createElement("airline");
      const nameElement = xmlDoc.createElement("name");
      const countryElement = xmlDoc.createElement("country");
      const typeElement = xmlDoc.createElement("type");

      // Set the text content of the new elements
      nameElement.textContent = newAirline.name;
      countryElement.textContent = newAirline.country;
      typeElement.textContent = newAirline.type;

      // Append the new elements to the airline element
      newAirlineElement.appendChild(nameElement);
      newAirlineElement.appendChild(countryElement);
      newAirlineElement.appendChild(typeElement);

      // Append the new airline element to the root of the XML document
      const airlinesElement = xmlDoc.documentElement;
      airlinesElement.appendChild(newAirlineElement);

      // Update the airline list with the new data
      updateAirlineList(xmlDoc);
      // Reset the newAirline state
      setNewAirline({ name: "", country: "", type: "" });

      // In a real application, you would save the updated XML here
      // For now, we'll just log it to the console
      const serializer = new XMLSerializer();
      console.log(serializer.serializeToString(xmlDoc));
    }
  };

  // Handler for sorting the airline list
  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      // If the same key is clicked, reverse the sort direction
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      // If a new key is clicked, set it as the sort key and default to ascending order
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  // Create a sorted copy of the airlines array based on current sort key and direction
  const sortedAirlines = [...airlines].sort((a, b) => {
    if (a[sortKey] < b[sortKey]) return sortDirection === "asc" ? -1 : 1;
    if (a[sortKey] > b[sortKey]) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Render the component
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">
        Airlines
      </h1>

      {/* Form for adding a new airline */}
      <form
        onSubmit={handleSubmit}
        className=" bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
      >
        {/* Input field for airline name */}
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
        {/* Input field for country */}
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
        {/* Dropdown for airline type */}
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
        {/* Submit button for the form */}
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Add Airline
          </button>
        </div>
      </form>

      {/* Buttons for sorting the airline list */}
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

      {/* List of airlines */}
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

// Export the AirlineList component as the default export
export default AirlineList;
