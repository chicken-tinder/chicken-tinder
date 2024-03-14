import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FullWidthText } from "../components/Input/Text";
import { SmallButton } from "../components/Input/Buttons";
import { BigText } from "../components/Input/Text";
import TextButtonInput from "../components/Input/TextButtonInput";
import toast from "react-hot-toast";
import CoopContext from "../context/coop-context";
import Table from "../components/Table";

export default function GroupListPage() {
	const navigate = useNavigate();
	const params = useParams();
	const coopContext = useContext(CoopContext);
	const [flock, setFlock] = useState([]);

	useEffect(() => {
		fetch(`${process.env.REACT_APP_API_URL}/flocks/${params.coopName}/chicks/`)
			.then((response) => response.json())
			.then((data) => setFlock(data))
			.catch((error) => console.error("Error:", error));
	}, [params.coopName]);

	function copyToClipboardAndNotify(input) {
		navigator.clipboard.writeText(input);
		toast.success("Copied to clipboard!", {
			position: "bottom-right",
		});
	}

	useEffect(() => {
		coopContext.connectToFlock(params.coopName);
	}, [params.coopName]);

	useEffect(() => {
		console.log(coopContext.messages);
	}, [coopContext.messages]);

	return (
		<div className="flex flex-col space-y-normal justify-center w-5/6">
			<FullWidthText>Coop Name: {params.coopName}</FullWidthText>
			<TextButtonInput
				value={window.location.href.replace("/lobby", "/join")}
				buttonText="copy invite link"
				onClick={copyToClipboardAndNotify}
				textDisabled={true}
			/>
			<BigText>My Flock</BigText>
			<Table rows={flock} />
			<SmallButton
				buttonText="let's go -->"
				onClick={() => navigate(`/flock/${params.coopName}/nominations`)}
			/>
		</div>
	);
}
