type Option<T extends string> = {
    label: string;
    value: T;
}

type selectOptionsProps<T extends string> = {
    options: Option<T>[];
    selected: T;
    setSelected: React.Dispatch<React.SetStateAction<T>>;
    placeholder?: string;
}


export default function SelectOptions<T extends string>({ options, selected, setSelected, placeholder = "Select an option" }: selectOptionsProps<T>) {

    return (

    <div className="mt-1">
        <select
            value={selected}
            onChange={(e) => setSelected(e.target.value as T)}
            className={`px-4 py-2 rounded-md border w-full 
            ${selected === "" ? "text-primary-200" : "text-text"}
            border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary`}
        >
            <option value="" disabled hidden >
                {placeholder}
            </option>

            {options.map((option) => (
                <option key={option.value} value={option.value} className="text-black">
                    {option.label}
                </option>
            ))}

        </select>
        </div>
    );
}
