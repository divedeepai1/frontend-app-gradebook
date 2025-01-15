import React, { useEffect, useState } from "react";

import { DataTable } from '@openedx/paragon';

import useGradebookTableData from './hooks';
import { useParams } from "react-router";

/**
 * <GraebookTable />
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
        const url = `https://wordaddin.educating.ai/api/openedx/get_all_edx_rubrics_scores_for_user?course_id=${encodeURIComponent(courseId)}&user_id=${1}`;
        const requestBody = { name: "hello" };
  
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });
  
        const result = await response.json();
  
        if (result && result.rubric_and_scores) {
          setData((prevData) => {
            const updatedData = [...prevData];
  
            const existingRowIndex = updatedData.findIndex(
              (row) => row.username === result.user_id
            );
  
            // Updated row from API data
            const updatedRow = {
              "Username": result.username || result.user_id, // Use `username` if provided, fallback to `user_id`
              "Full Name": result.full_name || "Divedeep", // Replace with actual `full_name` from API if available
              "Email": result.email || "e.divedeepai@gmail.com", // Replace with actual `email` from API if available
              "Total Grade (%)": result.total_grade || "---", // Replace with calculated or provided grade
              ...result.rubric_and_scores.reduce((acc, rubric) => {
                acc[`rubric_${rubric.rubric_id}`] = rubric.score ?? "---"; // Map rubric scores
                return acc;
              }, {}),
            };
  
            if (existingRowIndex > -1) {
              updatedData[existingRowIndex] = {
                ...updatedData[existingRowIndex],
                ...updatedRow,
              };
            } else {
              updatedData.push(updatedRow);
            }
  
            return updatedData;
          });
  
          const rubricColumns = result.rubric_and_scores.map((rubric, index) => ({
            Header: `${rubric.rubric_title} ${index + 1}`,
            accessor: `rubric_${rubric.rubric_id}`,
          }));
  
          setColumns((prevColumns) => {
            const existingAccessors = new Set(prevColumns.map((col) => col.accessor));
            const newColumns = rubricColumns.filter(
              (col) => !existingAccessors.has(col.accessor)
            );
  
            return [...prevColumns, ...newColumns];
          });
        }
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
        rowHeaderColumnKey="username"
        hasFixedColumnWidths
        itemCount={grades.length}
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
