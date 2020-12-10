import React, { useRef, useState } from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import apiFetcher from "../../utils/apiFetcher";
import Loader from "../../utils/Loader";
import { Auth } from "../../utils/firebase";
import { faLink, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useAsync } from "react-async";
import { useParams } from "react-router-dom";
import Avatar from "../../Avatar.png";
import copy from "copy-to-clipboard";

// const RoleList = ["พนักงานเสิร์ฟ", "พ่อครัว"];

const UserList = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserContainer = styled.div`
  display: grid;
  grid-template-columns: 200px repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  align-items: center;
  padding: 15px;
  border-bottom: 1px dashed #ddd;
  font-size: calc(1vw + 1vh);
  grid-gap: 10px;

  & > div {
    grid-row: 1 / 3;
  }

  select {
    font-size: 0.9em;
    padding: 3px;
    height: 50px;
    width: 100%;
  }

  .name {
    grid-column: 2;
  }
  .role {
    grid-column: 3;
  }
  .operation {
    grid-row: 3;
    justify-self: flex-end;
    grid-column: 1 / 4;
  }

  @media only screen and (max-width: 450px) {
    & {
      grid-gap: 10px;
      grid-template-columns: 1fr;
      grid-template-rows: 100px repeat(3, 1fr);
      font-size: 0.9em;
    }
    .name,
    .role,
    & > div,
    .operation {
      grid-column: 1;
    }
    .name {
      grid-row: 2;
    }
    .role {
      grid-row: 3;
    }
    .operation {
      grid-row: 4;
      justify-self: center;
    }
  }
`;

const UserPicture = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 10px;

  @media only screen and (max-width: 900px) {
    height: 125px;
    width: 125px;
  }

  @media only screen and (max-width: 800px) {
    margin-right: 0;
    height: 100px;
    width: 100px;
    // margin-bottom: 20px;
  }
`;

const LoginButton = styled.button`
  padding: 4px 15px;
  border-radius: 3px;
  background-color: blue;
  color: white;
  border: none;
  font-size: 0.7em;
  transition: all 0.3s;

  &:hover {
    background-color: #005;
    transition: all 0.3s;
    cursor: pointer;
  }

  svg {
    color: #eee;
  }
`;
const DeleteButton = styled.button`
  padding: 4px 15px;
  border-radius: 3px;
  background-color: red;
  color: white;
  border: none;
  font-size: 0.7em;
  transition: all 0.3s;

  &:hover {
    background-color: #500;
    transition: all 0.3s;
    cursor: pointer;
  }

  svg {
    color: #eee;
  }
`;

const UserPictureContainer = styled.div`
  position: relative;
  justify-self: center;
  grid-column: 1;
  grid-row: 1 / 4 !important;

  &:hover {
    cursor: pointer;

    img {
      filter: grayscale(0.5) brightness(0.3);
      transition: all 0.3s;
    }
    .upload {
      display: block;
    }
  }

  @media only screen and (max-width: 450px) {
    grid-row: 1 !important;
  }
`;

const Upload = styled.span`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: calc(0.9vw + 0.8vh);
  white-space: nowrap;
  color: white;
  display: none;
  z-index: 2;
`;

const NameInput = styled.input.attrs((props) => ({
  type: "text",
}))`
  padding: 10px;
  font-size: 0.7em;
  width: 100%;
  height: 50px;
`;

const Title = styled.span`
  font-weight: bold;
  font-size: 0.7em;
`;

const WorkerAdd = styled.button`
  padding: 5px 10px;
  background-color: #232323;
  color: white;
  border: none;
  border-radius: 3px;
  align-self: flex-start;
  font-size: 0.7em;
  margin-bottom: 15px;
  transition: all 0.3s;

  &:hover {
    background-color: #555555;
    padding: 5px 15px;
    transition: all 0.3s;
    cursor: pointer;
  }
`;

function UserPictureStyled({ img, worker_id, reloader }) {
  const fileRef = useRef();
  const imgRef = useRef();
  const { restaurant_id } = useParams();

  async function handleChange(event) {
    const reader = new FileReader();
    reader.onload = (event) => {
      imgRef.current.src = reader.result;
    };

    if (event.target.files?.length > 0)
      reader.readAsDataURL(event.target.files[0]);

    const form = new FormData();
    if (event.target?.files?.length > 0)
      form.append("img", event.target.files[0]);

    const json = await apiFetcher({
      url: `/manager/worker/update.php?user_uid=${Auth.currentUser.uid}&restaurant_id=${restaurant_id}&method=img&worker_id=${worker_id}`,
      option: {
        headers: { Accept: "application/json" },
        method: "POST",
        body: form,
      },
    });

    if (!(json?.message === "success")) console.error(json?.message);
  }

  return (
    <UserPictureContainer onClick={() => fileRef.current.click()}>
      <input
        onChange={handleChange}
        accept="image/*"
        ref={fileRef}
        type="file"
        style={{ display: "none" }}
      />
      <Upload className="upload">เลือกรูปภาพ</Upload>
      <UserPicture ref={imgRef} src={img} alt="worker" />
    </UserPictureContainer>
  );
}

const Status = styled.span`
  color: ${(props) => (props.success ? "green" : props.error ? "red" : "blue")};
  font-size: 0.9em;
`;

function WorkerName({ name: workerName, worker_id }) {
  const [name, nameSet] = useState(workerName);
  const [status, statusSet] = useState();
  const [timer, timerSet] = useState();
  const { restaurant_id } = useParams();

  function handleChange(event) {
    if (event.target.value.search(/[',"]/) !== -1)
      return event.preventDefault();
    const value = event.target.value;
    nameSet(value);
    statusSet(<Status>กำลังประมวล...</Status>);
    if (timer) clearTimeout(timer);
    timerSet(setTimeout(() => nameUpdater(value), 500));
  }

  async function nameUpdater(name) {
    const json = await apiFetcher({
      url: `/manager/worker/update.php?user_uid=${Auth.currentUser.uid}&restaurant_id=${restaurant_id}&method=name&name=${name}&worker_id=${worker_id}`,
    });

    if (json?.message === "success") {
      statusSet(<Status success>อัพเดธสำเร็จ</Status>);
    } else {
      statusSet(<Status error>มีปัญหาในการแก้ไข</Status>);
    }

    timerSet(setTimeout(() => statusSet(), 1000));
  }

  return (
    <div className="name">
      <Title>ชื่อพนักงาน {status}</Title>
      <NameInput type="text" name="name" value={name} onChange={handleChange} />
    </div>
  );
}

function WorkerRole({ role: workerRole, worker_id }) {
  const [role, roleSet] = useState(workerRole);
  const { restaurant_id } = useParams();
  const [timer, timerSet] = useState();
  const [status, statusSet] = useState();

  function handleChange(event) {
    const value = event.target.value;
    roleSet(value);
    roleUpdater(value);
    clearTimeout(timer);
  }

  async function roleUpdater(role) {
    const json = await apiFetcher({
      url: `/manager/worker/update.php?user_uid=${Auth.currentUser.uid}&restaurant_id=${restaurant_id}&method=role&role=${role}&worker_id=${worker_id}`,
    });

    if (json?.message === "success") {
      statusSet(<Status success>อัพเดธสำเร็จ</Status>);
    } else {
      statusSet(<Status error>มีปัญหาในการแก้ไข</Status>);
    }

    timerSet(setTimeout(() => statusSet(), 1000));
  }

  return (
    <div className="role">
      <Title>ตำแหน่งงาน {status}</Title>
      <br />
      <select onChange={handleChange} value={role}>
        <option value={0}>พนักงานเสิร์ฟ</option>
        <option value={1}>พ่อครัว</option>
        <option value={2}>ผู้ดูแล</option>
      </select>
    </div>
  );
}

function WorkerRow({ data, reloader }) {
  if (!(data.result?.length > 0)) return <span>ไม่มีพนักงานภายในร้านนี้</span>;

  const eachRows = data.result.map((map) => {
    return <UserContainerizer key={map.id} map={map} reloader={reloader} />;
  });

  return eachRows;
}

function UserContainerizer({ map, reloader }) {
  const { restaurant_id } = useParams();
  const [copied, copiedSet] = useState(false);
  const [timer, timerSet] = useState();

  async function deleteWorker(id) {
    const confirm = window.confirm("ยืนยันการลบพนักงาน");
    if (confirm) {
      const json = await apiFetcher({
        url: `/manager/worker/delete.php?user_uid=${Auth.currentUser.uid}&restaurant_id=${restaurant_id}&worker_id=${id}`,
      });

      if (json?.message === "success") {
        reloader();
      } else {
        console.error(json?.message);
      }
    }
  }

  async function urlCreate(id) {
    const json = await apiFetcher({
      url: `/manager/worker/auth_url.php?worker_id=${id}&restaurant_id=${restaurant_id}&user_uid=${Auth.currentUser.uid}`,
    });

    if (json?.message === "success") {
      copiedSet(true);
      if (timer) clearTimeout(timer);
      timerSet(setTimeout(() => copiedSet(false), 1000));

      copy(json.result);
    } else {
      console.error(json?.message);
    }
  }

  return (
    <UserContainer>
      <UserPictureStyled img={map.img} worker_id={map.id} />
      <WorkerName name={map.name} worker_id={map.id} />
      <WorkerRole role={map.role} worker_id={map.id} />
      <div className="operation">
        <LoginButton onClick={() => urlCreate(map.id)}>
          <FontAwesomeIcon icon={faLink} />{" "}
          {copied ? "คัดลอกแล้ว !" : "คัดลอกลิ้งค์เข้าใช้งาน"}
        </LoginButton>{" "}
        <DeleteButton onClick={() => deleteWorker(map.id)}>
          <FontAwesomeIcon icon={faTrash} /> ลบพนักงาน
        </DeleteButton>
      </div>
    </UserContainer>
  );
}

function WorkerManage() {
  const { restaurant_id } = useParams();
  const { data, error, reload } = useAsync({
    promiseFn: apiFetcher,
    url: `/manager/worker/get.php?user_uid=${Auth.currentUser.uid}&restaurant_id=${restaurant_id}`,
  });

  async function addWorker() {
    const json = await apiFetcher({
      url: `/manager/worker/insert.php?user_uid=${Auth.currentUser.uid}&restaurant_id=${restaurant_id}`,
    });

    if (json?.message === "success") {
      reload();
    } else {
      console.error(json?.message);
    }
  }

  if (error) return error;
  return (
    <UserList>
      <WorkerAdd onClick={addWorker}>
        <FontAwesomeIcon icon={faPlus} /> เพิ่มพนักงาน
      </WorkerAdd>
      {data?.message === "success" ? (
        <WorkerRow reloader={reload} data={data} />
      ) : (
        <Loader />
      )}
    </UserList>
  );
}

export default WorkerManage;
