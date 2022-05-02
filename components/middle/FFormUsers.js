import { motion } from "framer-motion";

const inputs = {
  initial: {
    y: -20,
    opacity: 0
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.7,
      ease: [0.6, -0.05, 0.01, 0.99],
    },
  },
};

export default function FFormUsers(users) {

  return (
    <motion.div
      variants={inputs}
      className="mb-16 md:ml-64 w-full"
    >

      <table className="min-w-full border-collapse block md:table">

        <thead className="block md:table-header-group">

          <tr className="border md:border-none block md:table-row absolute -top-full md:top-auto -left-full md:left-auto  md:relative">

            <th className="bg-color_B p-2 text-white font-bold md:border text-left block md:table-cell">Логин</th>
            <th className="bg-color_B p-2 text-white font-bold md:border text-left block md:table-cell">Почта</th>
            <th className="bg-color_B p-2 text-white font-bold md:border text-left block md:table-cell">Статус</th>

          </tr>

        </thead>

        <tbody className="block md:table-row-group">

          {users?.users?.map((user) => {
            return (

              <tr className="border md:border-none block md:table-row" key={user.id}>

                <td className="p-2 md:border text-left block md:table-cell flex flex-row items-center">
                  <div className="flex flex-row items-center">
                    <img
                      className="h-8 w-8 rounded-full"
                      src={`https://ui-avatars.com/api/?name=${user.login}&size=256&font-size=0.33&length=2`}
                      alt=""
                    />
                    <p className="font-semibold text-black ml-1">{user.login}</p>
                  </div>
                </td>

                <td className="p-2 md:border text-left block md:table-cell">
                  <span className="inline-block w-1/3 md:hidden font-bold">Почта</span>{user.email}
                </td>

                <td className="p-2 md:border text-left block md:table-cell">
                  <span className="inline-block w-1/3 md:hidden font-bold">Статус</span>
                  <span className={`px-2 py-1 font-semibold leading-tight rounded-sm ${user.isActivated ? 'text-green-700 bg-green-100' : 'text-gray-700 bg-gray-100'}`}>
                    {user.isActivated ? 'Активирован' : 'Не активирован'}
                  </span>
                </td>

              </tr>

            )
          })}

        </tbody>

      </table>

    </motion.div>
  );

};