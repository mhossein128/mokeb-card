import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import InviteModal from "./invite-modal";

function Users() {
  const [users, setusers] = useState([]);
  console.log(users);
  const [selectedUser, setselectedUser] = useState(null);
  const input = useRef(null);
  const handleSearch = (e) => {
    axios
      .get("http://localhost:5000/api/guest/search", {
        params: { search: input.current.value },
      })
      .then((res) => {
        setusers(res.data);
      });
  };

  useEffect(() => {
    handleSearch();
  }, []);

  const handleUpdate = useCallback(
    (id, count) => {
      const index = users.findIndex((item) => item.id === id);
      const copy = [...users];
      copy[index]._count.Invitation = count;

      setusers(copy);
    },
    [users]
  );

  return (
    <div className="p-10">
      <input
        ref={input}
        type="search"
        name=""
        placeholder="نام خادم"
        className="border p-2"
        id=""
      />
      <button className="bg-blue-400 p-2 rounded-lg" onClick={handleSearch}>
        جستجو
      </button>

      <table className="w-full">
        <thead>
          <tr>
            <th className="border p-2">ردیف</th>
            <th className="border p-2">نام</th>
            <th className="border p-2">تعداد رزرو</th>
            <th className="border p-2">اعمال</th>
          </tr>
        </thead>
        <tbody>
          {users.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50 text-center">
              <td className="border p-2">{index + 1}</td>
              <td className="border p-2">{item.name}</td>
              <td className="border p-2">{item._count.Invitation}</td>
              <td className="border p-2">
                <button onClick={() => setselectedUser(item)}>رزرو</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedUser &&
        createPortal(
          <InviteModal
            user={selectedUser}
            handleUpdate={handleUpdate}
            close={() => setselectedUser(null)}
          />,
          document.body
        )}
    </div>
  );
}

export default Users;
