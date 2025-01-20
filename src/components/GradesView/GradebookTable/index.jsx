import React, { useEffect, useState } from "react";
import { DataTable } from "@openedx/paragon";
import useGradebookTableData from "./hooks";
import { useParams } from "react-router";

/**
 * <GradebookTable />
 * This is the wrapper component for the Grades tab gradebook table, holding
 * a row for each user, with a column for their username, email, and total grade,
 * along with one for each subsection in their grade entry.
 */
export const GradebookTable = () => {
  const {
    columns: initialColumns,
    data: initialData,
    grades,
    nullMethod,
    emptyContent,
  } = useGradebookTableData();

  const { courseId } = useParams();
  const [columns, setColumns] = useState(initialColumns);
  const [data, setData] = useState(initialData);

  useEffect(() => {
    const fetchAndModifyData = async () => {
      try {
        const url = `https://wordaddin.educating.ai/api/openedx/get_all_edx_rubrics_scores_for_users?course_id=${encodeURIComponent(
          courseId
        )}`;
        const requestBody = { name: "hello" };
  
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });
  
        const result = await response.json();
  
        // Process columns
        const uniqueRubrics = new Map();
        result.all_users_scores.forEach((user) => {
          user.rubric_and_scores.forEach((rubric, index) => {
            const uniqueKey = `${rubric.rubric_title}_${index}`;
            if (!uniqueRubrics.has(uniqueKey)) {
              uniqueRubrics.set(uniqueKey, rubric.rubric_title);
            }
          });
        });
  
        const newColumns = [
          ...initialColumns,
          ...Array.from(uniqueRubrics.entries()).map(([uniqueKey, rubricTitle]) => ({
            Header: rubricTitle,
            accessor: uniqueKey, // Use unique key as accessor
          })),
        ];
  
        // Process data
        const newData = result.all_users_scores.map((user) => {
          const userRow = {
            Username: user.user_id,
            Email: user.user_email || "N/A",
            ...user.rubric_and_scores.reduce((acc, rubric, index) => {
              const uniqueKey = `${rubric.rubric_title}_${index}`;
              acc[uniqueKey] = rubric.score ?? "N/A";
              return acc;
            }, {}),
          };
          return userRow;
        });
  
        setColumns(newColumns);
        setData(newData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    fetchAndModifyData();
  }, [courseId]);
  

  return (
    <div className="gradebook-container">
      <DataTable
        columns={columns}
        data={data}
        rowHeaderColumnKey="Username"
        hasFixedColumnWidths
        itemCount={data.length}
        RowStatusComponent={nullMethod}
      >
        <DataTable.TableControlBar />
        <DataTable.Table />
        <DataTable.EmptyTable content={emptyContent} />
      </DataTable>
    </div>
  );
};

GradebookTable.propTypes = {};

export default GradebookTable;
