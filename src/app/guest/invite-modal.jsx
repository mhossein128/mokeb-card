import axios from "axios";
import { useEffect, useRef, useState } from "react";

function InviteModal({ user, close, handleUpdate }) {
  const form = useRef(null);
  const [inviteForm, setinviteForm] = useState(user.Invitation);
  const [capacities, setcapacities] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/guest/capacity")
      .then((res) => setcapacities(res.data));
  }, []);

  const formSubmit = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:5000/api/guest/invite", {
        name: e.target[0].value,
        mobile: e.target[1].value,
        capacityId: e.target[2].value,
        userId: user.id,
      })
      .then((res) => {
        handleUpdate(user.id, user._count.Invitation + 1);

        form.current[0].value = "";
        form.current[1].value = "";
      });
  };

  console.log(user);
  return (
    <div
      dir="rtl"
      onClick={close}
      className="fixed top-0 left-0 w-screen h-screen bg-gray-900/60 grid place-content-center"
    >
      <div id="print"
        onClick={(e) => e.stopPropagation()}
        className="p-2 bg-white rounded-lg w-[500px] max-h-[80vh] h-[300px] overflow-auto"
      >
        <h3>{user.name}</h3>

        <form
          ref={form}
          onSubmit={formSubmit}
          className="grid grid-cols-1 gap-3 mt-3"
        >
          <input
            className="border p-3 rounded-md"
            type="text"
            placeholder="نام مهمان"
          />
          <input
            className="border p-3 rounded-md"
            type="text"
            placeholder="تلفن مهمان"
          />
          <select className="border p-3 rounded-md" name="" id="">
            {capacities.map((item, index) => (
              <option key={index} value={item.id}>
                {item.gender === "MALE" ? "مرد" : "زن"} _{" "}
                {new Date(item.date).toLocaleString("fa-IR", {
                  dateStyle: "short",
                })}
              </option>
            ))}
          </select>
          <input
            className="bg-green-300 rounded-md py-1 px-4 cursor-pointer"
            type="submit"
            value="تایید"
          />
        </form>
      </div>
    </div>
  );
}

export default InviteModal;
