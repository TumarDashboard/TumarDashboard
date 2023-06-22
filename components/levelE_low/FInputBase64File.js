const fileToDataUri = (file) => {

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      resolve(event.target.result);
    };
    reader.readAsDataURL(file);
  });

};

export function FInputBase64File({ setUri, ...props }) {

  const onChange = async ({ target }) => {

    const file = target.files[0];

    if (!file) {
      alert("Файл не выбран");
      setUri(null);
      return;
    }

    if (file.size > 16777216) {
      alert("Размер файла не должен превышать 16mb");
      setUri(null);
      target.value = null;  
      return;
    }

    fileToDataUri(file).then((dataUri) => {
      setUri(dataUri);
    });

  };

  return (
    <input
      type="file"
      onChange={onChange}
      // accept=".xlsx"
      className="border border-gray-300 block w-full 
            focus:border-blue-300 focus:outline-none focus:ring focus:ring-blue-200 focus:ring-opacity-50 
            rounded-md shadow-sm
            file:px-4 file:py-2 file:bg-red-600 
            file:font-semibold file:capitalize file:text-white
            file:border-none file:rounded-l-md 
            hover:file:bg-red-700 active:file:bg-red-700 
            disabled:file:opacity-25"
      {...props}
    />
  )

}