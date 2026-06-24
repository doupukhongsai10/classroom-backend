import express from 'express';
import { and, desc, eq, getTableColumns, ilike, or, sql } from 'drizzle-orm';
import { departments, subjects } from '../db/schema/index.js';
import {db} from "../db/index.js";

const router = express.Router();

router.get("/",async(req,res) => {
  try{
    const { search, department, page=1,limit=10}=req.query;

    const pageValue = typeof page === 'string' ? parseInt(page, 10) : NaN;
    const limitValue = typeof limit === 'string' ? parseInt(limit, 10) : NaN;

    const currentPage = Math.max(1, isNaN(pageValue) ? 1 : pageValue);
    const limitPerPage = Math.max(1, isNaN(limitValue) ? 10 : limitValue);

    const offset = (currentPage-1)*limitPerPage;

    const filterConditions = [];

    //is search query exists, filter by subject name OR subject code
    if(search){
      filterConditions.push(
        or(
          ilike(subjects.name, `%${search}`),
          ilike(subjects.code, `%${search}`)
        )
      )
    }
    //if department filter exists, match department name
    if(department){
      filterConditions.push(ilike(departments.name, `%${department}`));
    }

    //combine all filters using AND if any exist
    const whereClause = filterConditions.length>0? and(...filterConditions): undefined;

    const countResult = await db
      .select({ count: sql<number>`count(*)`.mapWith(Number)})
      .from(subjects)
      .leftJoin(departments, eq(subjects.departmentId, departments.id))
      .where(whereClause);

    const totalCount = countResult[0]?.count?? 0;

    const subjectList = await db.select({
      ...getTableColumns(subjects),
      department: {...getTableColumns(departments)}
    }).from(subjects).leftJoin(departments, eq(subjects.departmentId, departments.id))
      .where(whereClause)
      .orderBy(desc(subjects.createdAt))
      .limit(limitPerPage)
      .offset(offset);

    res.status(200).json({
      data: subjectList,
      pagination: {
        page: currentPage,
        limit: limitPerPage,
        total: totalCount,
        totalPages: Math.ceil(totalCount/limitPerPage),
      }
    })

  }catch(e){
    console.error(`GET /subjects error: ${e}`);
    res.status(500).json({error: 'Failed to get subjects'});
  }
})
export default router;