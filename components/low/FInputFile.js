import { fromImage } from 'imtool';

const fileToDataUri = (file) =>
  new Promise((resolve, reject) => {

    fromImage(file).then(tool=>{

      tool.thumbnail(1024).toDataURL().then(dataURL=>{

        resolve(dataURL);
        
      }).catch(e=>reject(e));

    }).catch(e=>reject(e));

    //------------------------------------
    // const reader = new FileReader();

    // reader.onload = (event) => {
    //   console.log(event);
    //   resolve(event.target.result);
    // };

    // reader.readAsDataURL(file);
    //------------------------------------
  });

export function FInputFile({ setUri, ...props }) {

  const onChange = ({ target }) => {

    const img = target.files[0];

    if (!img) {
      alert("Файл не выбран");
      setUri(null);
      return;
    }

    if (img.size > 16777216) {
      alert("Размер файла не должен превышать 16mb");
      setUri(null);
      target.value = null;
      return;
    }

    if (img.type.split('/')[0] != 'image') {
      alert("Для загрузки доступны только файлы с изображениями");
      setUri(null);
      target.value = null;
      return;
    }

    fileToDataUri(img).then((dataUri) => {
      setUri(dataUri);
    });

  };

  return (
    <input
      type="file"
      onChange={onChange}
      accept="image/*"
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